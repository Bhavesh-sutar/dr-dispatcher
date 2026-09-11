import { useState } from "react";
import { toast } from "sonner";

import drService from "../../services/drService";

import "./AddDREvent.css";

const AddDREvent = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    eventType: "",
    date: "",
    startTime: "",
    endTime: "",
    flexCalledMw: "",
    flexAvailableMw: "",
  });

  const [datacenters, setDatacenters] = useState([
    {
      dcId: "",
      flexCalledMw: "",
      flexAvailableMw: "",
    },
  ]);

  // fieldErrors shape:
  // {
  //   eventType, date, startTime, endTime, flexCalledMw, flexAvailableMw,
  //   flexCalledMwMismatch, flexAvailableMwMismatch, datacentersGeneral,
  //   datacenters: [{ dcId, flexCalledMw, flexAvailableMw }, ...]
  // }
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleDataCenterChange = (index, event) => {
    const { name, value } = event.target;

    setDatacenters((previousDatacenters) =>
      previousDatacenters.map((dc, dcIndex) =>
        dcIndex === index
          ? {
              ...dc,
              [name]: value,
            }
          : dc,
      ),
    );
  };

  const addDataCenter = () => {
    setDatacenters((previousDatacenters) => [
      ...previousDatacenters,
      {
        dcId: "",
        flexCalledMw: "",
        flexAvailableMw: "",
      },
    ]);
  };

  const removeDataCenter = (index) => {
    setDatacenters((previousDatacenters) =>
      previousDatacenters.filter((_, dcIndex) => dcIndex !== index),
    );
  };

  const numbersAreEqual = (first, second) => {
    return Math.abs(first - second) < 0.001;
  };

  // Same validation rules as before — just collected into a field-keyed
  // object instead of returning only the first error found. Nothing about
  // what counts as invalid has changed.
  const getFieldErrors = () => {
    const errors = {};
    const dcErrors = datacenters.map(() => ({}));

    if (!formData.eventType) {
      errors.eventType = "Event type is required.";
    }

    if (!formData.date) {
      errors.date = "Date is required.";
    }

    if (!formData.startTime) {
      errors.startTime = "Start time is required.";
    }

    if (!formData.endTime) {
      errors.endTime = "End time is required.";
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      errors.endTime = "End time must be later than start time.";
    }

    if (formData.flexCalledMw === "") {
      errors.flexCalledMw = "Flex Called is required.";
    } else if (Number(formData.flexCalledMw) < 0) {
      errors.flexCalledMw = "Flex Called cannot be negative.";
    }

    if (formData.flexAvailableMw === "") {
      errors.flexAvailableMw = "Flex Available is required.";
    } else if (Number(formData.flexAvailableMw) < 0) {
      errors.flexAvailableMw = "Flex Available cannot be negative.";
    }

    let hasDatacenterFieldErrors = false;

    datacenters.forEach((dc, index) => {
      if (!dc.dcId.trim()) {
        dcErrors[index].dcId = "Required.";
        hasDatacenterFieldErrors = true;
      }

      if (dc.flexCalledMw === "") {
        dcErrors[index].flexCalledMw = "Required.";
        hasDatacenterFieldErrors = true;
      } else if (Number(dc.flexCalledMw) < 0) {
        dcErrors[index].flexCalledMw = "Cannot be negative.";
        hasDatacenterFieldErrors = true;
      }

      if (dc.flexAvailableMw === "") {
        dcErrors[index].flexAvailableMw = "Required.";
        hasDatacenterFieldErrors = true;
      } else if (Number(dc.flexAvailableMw) < 0) {
        dcErrors[index].flexAvailableMw = "Cannot be negative.";
        hasDatacenterFieldErrors = true;
      }
    });

    const dcIdsSeen = new Map();

    datacenters.forEach((dc, index) => {
      const normalizedId = dc.dcId.trim().toLowerCase();

      if (!normalizedId) {
        return;
      }

      if (dcIdsSeen.has(normalizedId)) {
        const firstIndex = dcIdsSeen.get(normalizedId);

        dcErrors[index].dcId = "Duplicate ID.";
        dcErrors[firstIndex].dcId = "Duplicate ID.";
      } else {
        dcIdsSeen.set(normalizedId, index);
      }
    });

    // Only check DR-vs-DC totals once every individual field is valid —
    // otherwise a mismatch message would appear alongside "Required."
    // messages and confuse which problem to fix first.
    if (
      !errors.flexCalledMw &&
      !errors.flexAvailableMw &&
      !hasDatacenterFieldErrors &&
      datacenters.length > 0
    ) {
      const totalDCCalledMw = datacenters.reduce(
        (sum, dc) => sum + Number(dc.flexCalledMw),
        0,
      );

      const totalDCAvailableMw = datacenters.reduce(
        (sum, dc) => sum + Number(dc.flexAvailableMw),
        0,
      );

      if (!numbersAreEqual(totalDCCalledMw, Number(formData.flexCalledMw))) {
        errors.flexCalledMwMismatch = `Mismatch: DR total is ${formData.flexCalledMw} MW, but Data Center total is ${totalDCCalledMw} MW.`;
      }

      if (
        !numbersAreEqual(totalDCAvailableMw, Number(formData.flexAvailableMw))
      ) {
        errors.flexAvailableMwMismatch = `Mismatch: DR total is ${formData.flexAvailableMw} MW, but Data Center total is ${totalDCAvailableMw} MW.`;
      }
    }

    const datacenterHasAnyError = dcErrors.some(
      (dcErr) => Object.keys(dcErr).length > 0,
    );

    if (datacenters.length === 0) {
      errors.datacentersGeneral = "At least one Data Center is required.";
    }

    if (datacenterHasAnyError) {
      errors.datacenters = dcErrors;
    }

    return errors;
  };

  const hasAnyError = (errors) => {
    return Object.keys(errors).some((key) => {
      if (key === "datacenters") {
        return errors.datacenters.some(
          (dcErr) => Object.keys(dcErr).length > 0,
        );
      }
      return true;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitAttempted(true);

    const errors = getFieldErrors();

    if (hasAnyError(errors)) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      setCreating(true);

      const payload = {
        eventType: formData.eventType,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        flexCalledMw: Number(formData.flexCalledMw),
        flexAvailableMw: Number(formData.flexAvailableMw),
        datacenters: datacenters.map((dc) => ({
          dcId: dc.dcId.trim(),
          flexCalledMw: Number(dc.flexCalledMw),
          flexAvailableMw: Number(dc.flexAvailableMw),
        })),
      };

      const response = await drService.createDR(payload);

      const createdDR = response.data;

      toast.success("DR Event created successfully", {
        description: `DR ID: ${createdDR.drId}`,
        duration: 5000,
      });

      setShowConfirmation(false);
      onCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create DR:", error);
    } finally {
      setCreating(false);
    }
  };

  const dcFieldError = (index, fieldName) => {
    return fieldErrors.datacenters?.[index]?.[fieldName] || "";
  };

  return (
    <div className="add-dr-event-overlay">
      <div
        className="add-dr-event"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-dr-event-title"
      >
        <div className="add-dr-event-header">
          <div className="add-dr-event-header-text">
            <h2 id="add-dr-event-title">Add DR Event</h2>
            <p>Create a new demand response event.</p>
          </div>

          <button
            type="button"
            className="add-dr-event-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form className="add-dr-form" onSubmit={handleSubmit} noValidate>
          <div className="add-dr-event-body">
            {submitAttempted && hasAnyError(fieldErrors) && (
              <div className="add-dr-error" role="alert">
                Please fix the highlighted fields below.
              </div>
            )}

            <div
              className={`form-group${fieldErrors.eventType ? " has-error" : ""}`}
            >
              <label htmlFor="eventType">Event Type</label>

              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
              >
                <option value="">Select event type</option>
                <option value="DR">DR</option>
                <option value="EEA">EEA</option>
              </select>

              {fieldErrors.eventType && (
                <span className="field-error">{fieldErrors.eventType}</span>
              )}
            </div>

            <div
              className={`form-group${fieldErrors.date ? " has-error" : ""}`}
            >
              <label htmlFor="date">Date</label>

              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />

              {fieldErrors.date && (
                <span className="field-error">{fieldErrors.date}</span>
              )}
            </div>

            <div className="form-row">
              <div
                className={`form-group${fieldErrors.startTime ? " has-error" : ""}`}
              >
                <label htmlFor="startTime">Start Time</label>

                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                />

                {fieldErrors.startTime && (
                  <span className="field-error">{fieldErrors.startTime}</span>
                )}
              </div>

              <div
                className={`form-group${fieldErrors.endTime ? " has-error" : ""}`}
              >
                <label htmlFor="endTime">End Time</label>

                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                />

                {fieldErrors.endTime && (
                  <span className="field-error">{fieldErrors.endTime}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div
                className={`form-group${
                  fieldErrors.flexCalledMw || fieldErrors.flexCalledMwMismatch
                    ? " has-error"
                    : ""
                }`}
              >
                <label htmlFor="flexCalledMw">Flex Called (MW)</label>

                <input
                  id="flexCalledMw"
                  name="flexCalledMw"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.flexCalledMw}
                  onChange={handleChange}
                />

                {(fieldErrors.flexCalledMw ||
                  fieldErrors.flexCalledMwMismatch) && (
                  <span className="field-error">
                    {fieldErrors.flexCalledMw ||
                      fieldErrors.flexCalledMwMismatch}
                  </span>
                )}
              </div>

              <div
                className={`form-group${
                  fieldErrors.flexAvailableMw ||
                  fieldErrors.flexAvailableMwMismatch
                    ? " has-error"
                    : ""
                }`}
              >
                <label htmlFor="flexAvailableMw">Flex Available (MW)</label>

                <input
                  id="flexAvailableMw"
                  name="flexAvailableMw"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.flexAvailableMw}
                  onChange={handleChange}
                />

                {(fieldErrors.flexAvailableMw ||
                  fieldErrors.flexAvailableMwMismatch) && (
                  <span className="field-error">
                    {fieldErrors.flexAvailableMw ||
                      fieldErrors.flexAvailableMwMismatch}
                  </span>
                )}
              </div>
            </div>

            <div className="datacenters-section">
              <div className="datacenters-header">
                <h3>Data Centers</h3>

                <p>Enter the flexibility values for each Data Center.</p>
              </div>

              {fieldErrors.datacentersGeneral && (
                <div className="field-error field-error-block">
                  {fieldErrors.datacentersGeneral}
                </div>
              )}

              {datacenters.map((dc, index) => (
                <div className="datacenter-row" key={index}>
                  <div
                    className={`form-group${
                      dcFieldError(index, "dcId") ? " has-error" : ""
                    }`}
                  >
                    <label>Data Center ID</label>

                    <input
                      type="text"
                      name="dcId"
                      placeholder="DC001"
                      value={dc.dcId}
                      onChange={(event) => handleDataCenterChange(index, event)}
                    />

                    {dcFieldError(index, "dcId") && (
                      <span className="field-error">
                        {dcFieldError(index, "dcId")}
                      </span>
                    )}
                  </div>

                  <div
                    className={`form-group${
                      dcFieldError(index, "flexCalledMw") ? " has-error" : ""
                    }`}
                  >
                    <label>Flex Called (MW)</label>

                    <input
                      type="number"
                      name="flexCalledMw"
                      min="0"
                      step="0.01"
                      value={dc.flexCalledMw}
                      onChange={(event) => handleDataCenterChange(index, event)}
                    />

                    {dcFieldError(index, "flexCalledMw") && (
                      <span className="field-error">
                        {dcFieldError(index, "flexCalledMw")}
                      </span>
                    )}
                  </div>

                  <div
                    className={`form-group${
                      dcFieldError(index, "flexAvailableMw") ? " has-error" : ""
                    }`}
                  >
                    <label>Flex Available (MW)</label>

                    <input
                      type="number"
                      name="flexAvailableMw"
                      min="0"
                      step="0.01"
                      value={dc.flexAvailableMw}
                      onChange={(event) => handleDataCenterChange(index, event)}
                    />

                    {dcFieldError(index, "flexAvailableMw") && (
                      <span className="field-error">
                        {dcFieldError(index, "flexAvailableMw")}
                      </span>
                    )}
                  </div>

                  <div className="datacenter-row-actions">
                    <button
                      type="button"
                      className="remove-datacenter-button"
                      onClick={() => removeDataCenter(index)}
                      disabled={datacenters.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-datacenter-button"
                onClick={addDataCenter}
              >
                + Add Data Center
              </button>

              <p className="datacenter-note">
                Note: The total Flex Called and Flex Available values must equal
                the sum of the corresponding values entered for all Data
                Centers.
              </p>
            </div>
          </div>

          <div className="add-dr-actions">
            <button
              type="button"
              className="cancel-dr-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="create-dr-button">
              Validate
            </button>
          </div>
        </form>

        {showConfirmation && (
          <div className="confirmation-overlay">
            <div
              className="confirmation-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-dr-event-title"
            >
              <h3 id="confirm-dr-event-title">Confirm DR Event Creation</h3>

              <p>Are you sure you want to create this DR event?</p>

              <p className="confirmation-warning">
                Once created, this DR event cannot be edited.
              </p>

              <div className="confirmation-actions">
                <button
                  type="button"
                  className="confirmation-cancel-button"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirmation-confirm-button"
                  onClick={handleConfirmCreate}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Confirm & Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDREvent;
