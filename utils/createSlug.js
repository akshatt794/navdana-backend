
const slugify = (url)=>{
    let urlSlug = url;
    
    let trimmedUrl = urlSlug.trim().toLowerCase();
    let i=0;
    while(i<trimmedUrl.length){
        if(trimmedUrl[i]!==" "){
            ++i;
        }else if(trimmedUrl[i]===' ' && trimmedUrl[i+1]===' '){
            trimmedUrl = trimmedUrl.slice(0,i)+trimmedUrl.slice(i+1);
            // console.log("X");
        }else if(trimmedUrl[i]===' ' && trimmedUrl[i+1]!==' '){
            trimmedUrl = trimmedUrl.slice(0,i)+"-"+trimmedUrl.slice(i+1);
        }
    }

    return trimmedUrl;
}

module.exports = {slugify};