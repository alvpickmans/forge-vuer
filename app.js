const ForgeSDK = require('forge-apis');

const getToken = async function(){
    let oauth = new ForgeSDK.AuthClientTwoLegged('GExAYhUByouuO5GySqP3PVGpyk79gSwh', 'ItHPXCxG7hz7WuYj', [
        'data:read',
        'data:write'
    ], true);

    try{
        let credentials = await oauth.authenticate();
        return credentials;
    }catch(err){
        throw err;
    }

}


console.log(getToken());