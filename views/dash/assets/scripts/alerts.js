/* Script for inserting dismissable alerts into webpages */

// The alert HTMLs
const success = `<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><i class="fa fa-check-circle"></i> $</div>`;

const info = `<div class="alert alert-info alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><i class="fa fa-info-circle"></i> $</div>`;

const error = `<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><i class="fa fa-times-circle"></i> $</div>`;

// The alert function
/**
 * Adds a dismissable alert to the webpage
 * @param  {HTMLElement} tag Tag whose content will be prepended by the alert
 * @param  {String} alertType Type of alert: "success" | "info" | "error"
 * @param  {String} message Message to be inserted in notification
 */
function addAlert(tag, alertType, message) {
  const alertHTML = eval(alertType);
  $(tag).prepend(alertHTML.replace("$", message));
  return;
}

// export default addAlert;
