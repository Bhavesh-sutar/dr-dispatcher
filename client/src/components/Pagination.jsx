import { useState } from "react";
import "./Pagination.css";

const getPageNumbers = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    page - 1,
    page,
    page + 1,
    "...",
    totalPages,
  ];
};

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}) => {
  const [pageInput, setPageInput] = useState("");

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  const handleGoToPage = () => {
    const targetPage = Number(pageInput);

    // Validate input
    if (
      !Number.isInteger(targetPage) ||
      targetPage < 1 ||
      targetPage > totalPages
    ) {
      return;
    }

    onPageChange(targetPage);
    setPageInput("");
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleGoToPage();
    }
  };

  return (
    <div className="pagination-container">

      <div className="pagination">

        {/* First */}
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        >
          First
        </button>

        {/* Previous */}
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="pagination-ellipsis"
              >
                ...
              </span>
            );
          }

          return (
            <button
              type="button"
              key={pageNumber}
              className={pageNumber === page ? "active" : ""}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>

        {/* Last */}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </button>

      </div>

      {/* Go to page */}
      <div className="pagination-go-to">
        <span>Go to page</span>

        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={(event) => setPageInput(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={page}
        />

        <button
          type="button"
          onClick={handleGoToPage}
        >
          Go
        </button>
      </div>

    </div>
  );
};

export default Pagination;