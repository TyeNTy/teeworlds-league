import React, { useEffect, useState } from "react";

const PaginatedTable = ({ filters, setFilters, titles, elements, total }) => {
  const [page, setPage] = useState(1);
  const [numberPerPage, setNumberPerPage] = useState(25);

  const addPage = () => {
    if (page + 1 > Math.ceil(total / numberPerPage)) return;
    setPage(page + 1);
  };
  const subtractPage = () => {
    if (page - 1 < 1) return;
    setPage(page - 1);
  };

  const changeNumberPerPage = (newValue) => {
    setNumberPerPage(newValue);
    if (page > Math.ceil(total / newValue)) setPage(Math.ceil(total / newValue));
    if (page < 1) setPage(1);
  };

  useEffect(() => {
    if (Math.ceil(total / numberPerPage) < page) setPage(Math.ceil(total / numberPerPage));
  }, [total]);

  useEffect(() => {
    setFilters({ ...filters, page, numberPerPage });
  }, [page, numberPerPage]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={numberPerPage}
            onChange={(e) => changeNumberPerPage(e.target.value)}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
          <span className="text-sm text-gray-600">({total} results)</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / numberPerPage)}
          </span>

          <div className="flex space-x-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded-md text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={subtractPage}
              disabled={page === 1}>
              Previous
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded-md text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={addPage}
              disabled={page >= Math.ceil(total / numberPerPage)}>
              Next
            </button>
          </div>
        </div>
      </div>

      <table className="table-auto w-full">
        <thead>
          <tr>
            {titles.map((title) => (
              <th key={title} className="px-4 py-2">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {elements.map((element, index) => (
            <tr
              key={index}
              className={element.className ? element.className : "cursor-pointer hover:bg-gray-100"}
              onClick={() => element.onClick(element)}>
              {element.renderFunctions.map((renderFunction, cellIndex) => {
                const result = renderFunction(element);
                if (result && typeof result === "object" && "content" in result && "className" in result) {
                  return (
                    <td key={cellIndex} className="border px-4 py-2">
                      <span className={result.className}>{result.content}</span>
                    </td>
                  );
                }

                return (
                  <td key={cellIndex} className="border px-4 py-2">
                    {result}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginatedTable;
