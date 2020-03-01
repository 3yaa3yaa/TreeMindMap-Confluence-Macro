const axios = require('axios');
const ReactDOM = require('react-dom');
const JoinPath = require('./JoinPath.js');
const Render=require('treemindmap').Render;

module.exports=class DataFetcher {
    constructor(contentid, filename) {
        this.contentid=contentid;
        this.filename=filename;
    }

    RetrieveDownloadURL()
    {
        let baseurl = AJS.params.baseUrl;
        let endpoint = JoinPath([baseurl, "/rest/api/content/", this.contentid,"/child/attachment?filename=",this.filename] );

        let promise = new Promise(resolve, reject => {
            axios.get(endpoint)
                .then((response)=>{
                    if(response.data.results.length>0)
                    {
                        console.log(JSON.stringify(response.data));
                        resolve(response.data.results[0]._links.download);
                    }
                    else
                    {
                        reject();
                    }
                })
        })
        return promise;
    }

    RenderRetrievingFile(domid, callback)
    {
        this.RetrieveDownloadURL()
            .then((downloadlink)=>
            {
                let setEditor = (data)=>{
                    data.property.isReadOnly=0;
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
                    response_data = JSON.stringify(response_data);
                    let promise = new Promise((resolve, reject) => {
                        Render(response_data, (state)=>{
                            callback(state)
                        }, domid, ReactDOM);
                        resolve();
                    });

                    promise.then(()=>{
                        //Resize the height
                        $(function() {
                            let windowHeight = $("#" + domid).find('.MainWindow-Content').height();
                            $("#" + domid).height(windowHeight);
                        })
                    })


                } catch(e)
                {
                    let element = document.getElementById(domid);
                    element.innerHTML="Failed to render the Mind Map... ;( \n" + e.message;
                    console.error("Failed to render the Mind Map: " + e.message)
                }
            })
    }


}
