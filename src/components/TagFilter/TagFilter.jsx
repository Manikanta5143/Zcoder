import React from "react";

const TagFilter = ({ tags, selectedTags, onTagChange }) => {

  return (

    <div className="tag-filter-wrapper">

      {tags.map(tag => (

        <button
          key={tag}
          onClick={() => onTagChange(tag)}
          className={`tag-filter-btn ${
            selectedTags.includes(tag)
              ? "active-tag"
              : ""
          }`}
        >

          {tag}

        </button>

      ))}

    </div>

  );

};

export default TagFilter;