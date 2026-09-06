import { useState } from "react";

const DRTable = ({ drs, onDRUpdate }) => {
  const [expandedDR, setExpandedDR] = useState(null);

  const handleExpand = (drId) => {
    setExpandedDR((current) =>
      current === drId ? null : drId
    );
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
          {drs.map((dr) => (
            <>
              {/* Main DR row */}
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

                <td>{dr.actions?.[0] || "-"}</td>

                <td>{dr.optimized?.[0] || "-"}</td>

                <td>{dr.submitted?.[0] || "-"}</td>
              </tr>

              {/* Data Center rows */}
              {expandedDR === dr.drId &&
                dr.datacenters?.map((dc) => (
                  <tr key={`${dr.drId}-${dc.dcId}`}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DRTable;