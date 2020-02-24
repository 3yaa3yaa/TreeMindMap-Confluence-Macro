const ReactDOM = require('react-dom');
const Render=require('treemindmap').Render;
const axios = require('axios');

export function RenderReadOnly(url, domid)
{
    let element = document.getElementById(domid);
    element.innerHTML="Generating a Mind Map...";

    axios.get(url)
        .then(response => {
            try{
                element.innerHTML="";
                let readonly_data = response.data;
                if(typeof readonly_data === "string")
                {
                    readonly_data = JSON.parse(readonly_data);
                }
                readonly_data.property.isReadOnly=2;
                readonly_data = JSON.stringify(readonly_data);
                Render(readonly_data, (state)=>{return state}, domid, ReactDOM);

                //Resize the height
                $(function() {
                    let windowHeight = $("#" + domid).find('.MainWindow-Content').height();
                    $("#" + domid).height(windowHeight);
                })
            } catch(e)
            {
                let element = document.getElementById(domid);
                element.innerHTML="Failed to render the Mind Map... ;( \n" + e.message;
                console.error("Failed to render the Mind Map: " + e.message)
            }
        })
}