import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  paginate
}) => {

  if(totalPages<=1) return null;

  return (

    <div className="pagination">

      <button
        disabled={currentPage===1}
        onClick={() =>
          paginate(currentPage-1)
        }
      >
        ← Previous
      </button>

      {Array.from(
        {length:totalPages},
        (_,i)=>i+1
      ).map(page=>(

        <button
          key={page}
          className={
            currentPage===page
              ?"active"
              :""
          }
          onClick={()=>paginate(page)}
        >

          {page}

        </button>

      ))}

      <button
        disabled={currentPage===totalPages}
        onClick={() =>
          paginate(currentPage+1)
        }
      >
        Next →
      </button>

    </div>

  );

};

export default Pagination;