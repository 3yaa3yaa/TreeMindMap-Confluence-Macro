
const EditorDialog = require('./EditorDialog.js');
const DataFetcher = require('./DataFetcher.js');


export function RenderReadOnly(url, domid)
{
    let element = document.getElementById(domid);
    element.innerHTML="Generating a Mind Map... :)";

    let dataFetcher = new DataFetcher();
    let setReadOnly = (data)=>{
        data.property.isReadOnly=2;
    };

    dataFetcher.RenderFromURL(url, domid, setReadOnly)

}

export function RenderEditor(ed)
{
    let dialog = new EditorDialog('toolbar');
    dialog.Render();
}



