
module.exports.getDate = getDate;

function getDate(){
  let today = new Date();
  let options = {
  weekday: "long",
  day: "numeric",
  month: "long"
  };
  let day = today.toLocaleDateString("en-US" , options);
  return day;
}
//module.exports.yourFunctionName = yourFunctionName
//that's if you wanted to create another function
