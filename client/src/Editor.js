import ReactQuill from "react-quill"; // built-in editor
import  "react-quill/dist/quill.snow.css";

// text editor to create/edit post
export default function Editor({value, onChange}) {
    const modules = {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline','strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
          ['link', 'image'],
          ['clean']
        ],
    };
    
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    return (
        <div className="content">
            <ReactQuill 
                value={value} 
                theme={'snow'}
                onChange={onChange} 
                modules={modules}
                formats={formats} />
        </div>
        
    );
}