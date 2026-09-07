import { useState } from "react";

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

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
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

            return (
              <>
                {/* Parent DR row */}
                <tr key={dr.drId}>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleExpand(dr.drId)}
                    >
                      {expandedDR === dr.drId ? "−" : "+"}
                    </button>
                  </td>

                  <td>{dr.drId}</td>

                  <td>
                    {new Date(dr.date).toLocaleDateString()}
                  </td>

                  <td>{dr.startTime}</td>

                  <td>{dr.endTime}</td>

                  <td>{dr.eventType}</td>

                  <td>{dr.status}</td>

                  <td>{dr.datacenters?.length || 0}</td>

                  <td>{dr.flexCalledMw}</td>

                  <td>{dr.flexAvailableMw}</td>

                  {/* ACTION */}
                  <td>
                    <button
                      type="button"
                      disabled={actionCompleted || isUpdating}
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
                      disabled={actionCompleted || isUpdating}
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
                  </td>

                  {/* OPTIMIZED */}
                  <td>
                    <button
                      type="button"
                      disabled={
                        !isOptIn ||
                        optimizedCompleted ||
                        isUpdating
                      }
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
                      disabled={
                        !isOptIn ||
                        optimizedCompleted ||
                        isUpdating
                      }
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
                  </td>

                  {/* SUBMITTED */}
                  <td>
                    <button
                      type="button"
                      disabled={
                        !isOptIn ||
                        !optimizedCompleted ||
                        submittedCompleted ||
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
                      disabled={
                        !isOptIn ||
                        !optimizedCompleted ||
                        submittedCompleted ||
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
                  </td>
                </tr>

                {/* Expanded Data Center rows */}
                {expandedDR === dr.drId &&
                  dr.datacenters?.map((dc) => (
                    <tr
                      key={`${dr.drId}-${dc.dcId}`}
                    >
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>

                      <td>{dc.dcId}</td>

                      <td>{dc.flexCalledMw}</td>

                      <td>{dc.flexAvailableMw}</td>

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