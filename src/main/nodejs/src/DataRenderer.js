const axios = require('axios');
const JoinPath = require('./JoinPath.js');
const Render=require('treemindmap').Render;

module.exports=class DataRenderer {
    constructor(contentid, filename) {
        this.contentid=contentid;
        this.filename=filename;
    }

    Render(data, callback, domid)
    {
        let promise = new Promise((resolve => {
            let dialog = document.getElementById(domid);
            if(dialog!=null)
            {
                while(dialog.lastChild){
                    dialog.removeChild(dialog.lastChild);
                }
            }
            let element = document.createElement('div');
            element.id = domid + "-data";
            dialog.appendChild(element);
            resolve(element.id);
        }));
        promise.then((id)=>{
            const ReactDOM = require('react-dom');
            Render(data, callback, id, ReactDOM);
        })
    }

    RetrieveDownloadURL()
    {
        let baseurl = AJS.params.baseUrl;
        let endpoint = JoinPath([baseurl, "/rest/api/content/", this.contentid,"/child/attachment?filename=" + this.filename] );

        let promise = new Promise((resolve, reject) => {
            axios.get(endpoint)
                .then((response)=>{
                    if(response.data.results.length>0)
                    {
                        resolve(JoinPath([baseurl,response.data.results[0]._links.download]) );
                    }
                    else
                    {
                        reject();
                    }
                })
        })
        return promise;
    }

    RenderSkeleton(callback, domid)
    {
        this.Render(null, callback, domid);
    }

    RenderRetrievingFile(domid, callback)
    {
        this.RetrieveDownloadURL()
            .then((downloadlink)=>
            {
                let setEditor = (data)=>{
                    data.property.isReadOnly=0;
                    data.property.previewMode=0;
                };
                this.RenderFromURL(downloadlink, domid, setEditor, callback );
            })
            .catch((response)=>{console.log("Searched Attachment but couldn't find any.")})
    }


    RenderFromURL(url, domid, preprocessing, callback)
    {
        let element = document.getElementById(domid);
        element.innerHTML="Generating a Mind Map... :)";

        axios.get(url)
            .then(response => {
                try{
                    element.innerHTML="";
                    let response_data = response.data;
                    if(typeof response_data === "string")
                    {
                        response_data = JSON.parse(response_data);
                    }
                    if(typeof preprocessing === "function")
                    {
                        preprocessing(response_data)
                    }

                    let promise = new Promise((resolve => {
                        response_data = JSON.stringify(response_data);
                        console.log("Rendering data in " + domid);
                        this.Render(response_data, callback, domid);
                        resolve();
                    }))

                    promise
                        .then(()=>{
                        //Resize the height
                        AJS.$(function() {
                            let windowHeight = AJS.$("#" + domid).find('.MainWindow-Content').height();
                            AJS.$("#" + domid).height(windowHeight);
                        })
                        })
                        .catch((error)=>{console.error(error)})

                } catch(e)
                {
                    let element = document.getElementById(domid);
                    element.innerHTML="Failed to render the Mind Map... ;( \n" + e.message;
                    console.error("Failed to render the Mind Map: " + e.message)
                }
            })
    }


}
