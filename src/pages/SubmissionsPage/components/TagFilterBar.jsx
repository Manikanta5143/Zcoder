import "./TagFilterBar.css";

export default function TagFilterBar({

    tags,

    selectedTags,

    onTagChange

}){

    return(

        <div className="tag-filter-bar">

            <button

                className={
                    selectedTags.length===0
                    ? "tag-chip active"
                    : "tag-chip"
                }

                onClick={()=>onTagChange("ALL")}

            >

                All

            </button>

            {

                tags.map(tag=>(

                    <button

                        key={tag}

                        className={

                            selectedTags.includes(tag)

                            ?

                            "tag-chip active"

                            :

                            "tag-chip"

                        }

                        onClick={()=>onTagChange(tag)}

                    >

                        {tag}

                    </button>

                ))

            }

        </div>

    )

}