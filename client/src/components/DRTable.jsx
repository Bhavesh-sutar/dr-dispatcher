import { useState } from "react";
import "./DRTable.css";

const statusClassMap = {
  Planned: "dr-badge-planned",
  "In-progress": "dr-badge-in-progress",
  Completed: "dr-badge-completed",
};

const DRTable = ({ drs, onDRUpdate }) => {
  const [expandedDR, setExpandedDR] = useState(null);
  const [updatingDR, setUpdatingDR] = useState(null);

  const handleExpand = (drId) => {
    setExpandedDR((current) =>
      current === drId ? null : drId
    );
  };

  const handleAction = async (
    drId,
    action,
    optimized,
    submitted
  ) => {
    try {
      setUpdatingDR(drId);

      await onDRUpdate(
        drId,
        action,
        optimized,
        submitted
      );
    } finally {
      setUpdatingDR(null);
    }
  };

  if (!drs.length) {
    return (
      <div className="dr-table-empty">
        No DRs match the current filters.
      </div>
    );
  }

  return (
    <div className="dr-table-wrap">
      <table className="dr-table">
        <thead>
          <tr>
            <th className="dr-table-col-expand"></th>
            <th>DR ID</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Event Type</th>
            <th>Status</th>
            <th>Data Centers</th>
            <th>Flex Called (MW)</th>
            <th>Flex Available (MW)</th>
            <th>Action</th>
            <th>Optimized</th>
            <th>Submitted</th>
          </tr>
        </thead>

        <tbody>
          {drs.map((dr) => {
            const action = dr.actions?.[0];
            const optimized = dr.optimized?.[0];
            const submitted = dr.submitted?.[0];

            const isUpdating = updatingDR === dr.drId;

            const actionCompleted = !!action;
            const optimizedCompleted = !!optimized;
            const submittedCompleted = !!submitted;

            const isOptIn = action === "Opt IN";
            const isOptOut = action === "Opt OUT";

            const isExpanded = expandedDR === dr.drId;

            const statusClass =
              statusClassMap[dr.status] || "dr-badge-default";

            return (
              <>
                {/* Parent DR row */}
                <tr
                  key={dr.drId}
                  className={
                    isUpdating
                      ? "dr-row dr-row-updating"
                      : "dr-row"
                  }
                >
                  <td className="dr-table-col-expand">
                    <button
                      type="button"
                      className="dr-expand-btn"
                      onClick={() => handleExpand(dr.drId)}
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? "Collapse data centers"
                          : "Expand data centers"
                      }
                    >
                      {isExpanded ? "−" : "+"}
                    </button>
                  </td>

                  <td className="dr-cell-id">{dr.drId}</td>

                  <td>
                    {new Date(dr.date).toLocaleDateString()}
                  </td>

                  <td>{dr.startTime}</td>

                  <td>{dr.endTime}</td>

                  <td>{dr.eventType}</td>

                  <td>
                    <span className={`dr-badge ${statusClass}`}>
                      {dr.status}
                    </span>
                  </td>

                  <td>{dr.datacenters?.length || 0}</td>

                  <td className="dr-cell-numeric">
                    {dr.flexCalledMw}
                  </td>

                  <td className="dr-cell-numeric">
                    {dr.flexAvailableMw}
                  </td>

                  {/* ACTION */}
                  <td>
                    <div className="dr-action-group">

                      {/* Before action is selected */}
                      {!actionCompleted && (
                        <>
                          <button
                            type="button"
                            className="dr-btn dr-btn-optin"
                            disabled={isUpdating}
                            onClick={() =>
                              handleAction(
                                dr.drId,
                                "Opt IN",
                                undefined,
                                undefined
                              )
                            }
                          >
                            Opt IN
                          </button>

                          <button
                            type="button"
                            className="dr-btn dr-btn-optout"
                            disabled={isUpdating}
                            onClick={() =>
                              handleAction(
                                dr.drId,
                                "Opt OUT",
                                undefined,
                                undefined
                              )
                            }
                          >
                            Opt OUT
                          </button>
                        </>
                      )}

                      {/* Selected action remains visible but locked */}
                      {isOptIn && (
                        <button
                          type="button"
                          className="dr-btn dr-btn-optin dr-btn-selected"
                          disabled
                        >
                          Opt IN
                        </button>
                      )}

                      {isOptOut && (
                        <button
                          type="button"
                          className="dr-btn dr-btn-optout dr-btn-selected"
                          disabled
                        >
                          Opt OUT
                        </button>
                      )}

                    </div>
                  </td>

                  {/* OPTIMIZED */}
                  <td>
                    <div className="dr-action-group">

                      {/* Opt OUT automatically sets Optimized = NO */}
                      {isOptOut ? (
                        <button
                          type="button"
                          className="dr-btn dr-btn-no dr-btn-selected"
                          disabled
                        >
                          NO
                        </button>
                      ) : !optimizedCompleted ? (
                        <>
                          <button
                            type="button"
                            className="dr-btn dr-btn-yes"
                            disabled={!isOptIn || isUpdating}
                            onClick={() =>
                              handleAction(
                                dr.drId,
                                undefined,
                                "YES",
                                undefined
                              )
                            }
                          >
                            YES
                          </button>

                          <button
                            type="button"
                            className="dr-btn dr-btn-no"
                            disabled={!isOptIn || isUpdating}
                            onClick={() =>
                              handleAction(
                                dr.drId,
                                undefined,
                                "NO",
                                undefined
                              )
                            }
                          >
                            NO
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Only selected option remains */}
                          {optimized === "YES" && (
                            <button
                              type="button"
                              className="dr-btn dr-btn-yes dr-btn-selected"
                              disabled
                            >
                              YES
                            </button>
                          )}

                          {optimized === "NO" && (
                            <button
                              type="button"
                              className="dr-btn dr-btn-no dr-btn-selected"
                              disabled
                            >
                              NO
                            </button>
                          )}
                        </>
                      )}

                    </div>
                  </td>

                  {/* SUBMITTED */}
                  <td>
                    <div className="dr-action-group">

                      {/* Opt OUT automatically sets Submitted = NO */}
                      {isOptOut ? (
                        <button
                          type="button"
                          className="dr-btn dr-btn-no dr-btn-selected"
                          disabled
                        >
                          NO
                        </button>
                      ) : !submittedCompleted ? (
                        <>
                          <button
                            type="button"
                            className="dr-btn dr-btn-yes"
                            disabled={
                              !isOptIn ||
                              !optimizedCompleted ||
                              isUpdating
                            }
                            onClick={() =>
                              handleAction(
                                dr.drId,
                                undefined,
                                undefined,
                                "YES"
                              )
                            }
                          >
                            YES
                          </button>

                          <button
                            type="button"
                            className="dr-btn dr-btn-no"
                            disabled={
                              !isOptIn ||
                              !optimizedCompleted ||
                              isUpdating
                            }
                            onClick={() =>
                              handleAction(
                                dr.drId,
                                undefined,
                                undefined,
                                "NO"
                              )
                            }
                          >
                            NO
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Only selected option remains */}
                          {submitted === "YES" && (
                            <button
                              type="button"
                              className="dr-btn dr-btn-yes dr-btn-selected"
                              disabled
                            >
                              YES
                            </button>
                          )}

                          {submitted === "NO" && (
                            <button
                              type="button"
                              className="dr-btn dr-btn-no dr-btn-selected"
                              disabled
                            >
                              NO
                            </button>
                          )}
                        </>
                      )}

                    </div>
                  </td>
                </tr>

                {/* Expanded Data Center rows */}
                {isExpanded &&
                  dr.datacenters?.map((dc) => (
                    <tr
                      key={`${dr.drId}-${dc.dcId}`}
                      className="dr-row-child"
                    >
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>

                      <td className="dr-cell-dc">
                        {dc.dcId}
                      </td>

                      <td className="dr-cell-numeric">
                        {dc.flexCalledMw}
                      </td>

                      <td className="dr-cell-numeric">
                        {dc.flexAvailableMw}
                      </td>

                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DRTable;