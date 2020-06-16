exports._UTCtoNormalTime = (time) => {
  var utcDate = new Date(time.toUTCString());
  return utcDate.toString();
};
