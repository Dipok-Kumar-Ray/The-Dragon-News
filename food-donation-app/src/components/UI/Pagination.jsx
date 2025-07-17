import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaEllipsisH,
  FaAngleDoubleLeft,
  FaAngleDoubleRight 
} from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalCount = 0, 
  limit = 10,
  className = '' 
}) => {
  // Generate page numbers to show
  const generatePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = generatePageNumbers();

  // Calculate start and end item numbers
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      {/* Results Info */}
      <div className="text-sm text-gray-600 text-center">
        <span className="font-medium">{startItem}</span> থেকে{' '}
        <span className="font-medium">{endItem}</span> পর্যন্ত,{' '}
        মোট <span className="font-medium">{totalCount}</span> টি ফলাফলের মধ্যে
      </div>

      {/* Pagination Controls */}
      <div className="join">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="join-item btn btn-sm"
          title="প্রথম পেইজ"
        >
          <FaAngleDoubleLeft />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="join-item btn btn-sm"
          title="আগের পেইজ"
        >
          <FaChevronLeft />
          <span className="hidden sm:inline ml-1">আগের</span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <button
                key={`dots-${index}`}
                className="join-item btn btn-sm btn-disabled"
                disabled
              >
                <FaEllipsisH />
              </button>
            );
          }

          return (
            <motion.button
              key={pageNumber}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNumber)}
              className={`join-item btn btn-sm ${
                currentPage === pageNumber 
                  ? 'btn-primary' 
                  : 'btn-outline'
              }`}
            >
              {pageNumber}
            </motion.button>
          );
        })}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="join-item btn btn-sm"
          title="পরের পেইজ"
        >
          <span className="hidden sm:inline mr-1">পরের</span>
          <FaChevronRight />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="join-item btn btn-sm"
          title="শেষ পেইজ"
        >
          <FaAngleDoubleRight />
        </button>
      </div>

      {/* Quick Jump (for large datasets) */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">পেইজে যান:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="input input-bordered input-sm w-16 text-center"
          />
          <span className="text-gray-600">/ {totalPages}</span>
        </div>
      )}
    </motion.div>
  );
};

// Compact Pagination for mobile/small spaces
export const CompactPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-sm btn-outline"
      >
        <FaChevronLeft className="mr-1" />
        আগের
      </button>

      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-sm btn-outline"
      >
        পরের
        <FaChevronRight className="ml-1" />
      </button>
    </div>
  );
};

// Simple Page Dots for carousel-like navigation
export const PageDots = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: totalPages }, (_, index) => (
        <motion.button
          key={index + 1}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPageChange(index + 1)}
          className={`w-3 h-3 rounded-full transition-colors ${
            currentPage === index + 1
              ? 'bg-primary'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
        />
      ))}
    </div>
  );
};

export default Pagination;