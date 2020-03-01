module.exports=function(parts, sep){
        let regexp =  new RegExp('(^/|/$)','g');
        return parts
            .map(item=>item.replace(regexp,''))
            .reduce((acc,cur)=>acc+"/"+cur);
    }