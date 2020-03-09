
const EditorDialog = require('./EditorDialog.js');
const DataRenderer = require('./DataRenderer.js');

export function RenderReadOnly(url, domid)
{
    let element = document.getElementById(domid);
    element.innerHTML="Generating a Mind Map... :)";

    let dataRenderer = new DataRenderer("","");
    let setReadOnly = (data)=>{
        data.property.isReadOnly=2;
    };

    dataRenderer.RenderFromURL(url, domid, setReadOnly)

}

export function RenderEditor(ed)
{
    let dialog = new EditorDialog('toolbar');
    dialog.Render();
}



