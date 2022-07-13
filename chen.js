module.exports.getDate=getDate;


function getDate(){

  var date=new Date();
  var today;
  // var day="";
  // var map=new Map([[0,"Sunday"],[1,"monday"],[2,"tuesday"],[3,"wednesday"],[4,"thursday"],[5,"friday"],[6,"saturday"]])
  var options={weekday:"long",day:"numeric",month:"long"};
  today=date.toLocaleDateString("en-US",options);
  return today;

}

module.exports.getDay=getDay;

function getDay(){
  var date=new Date();
  // var today;
  var options={weekday:"long"};
  return date.toLocaleDateString("en-US",options);
  // return today;


}
