const COURSE_ID = '<course id>';
const WEBHOOK_URL = '<web hook url>';

 function checkAnnouncements() {
  try {
    const props = PropertiesService.getScriptProperties();
    const lastId = props.getProperty('lastAnnouncementId');
    const announcements = Classroom.Courses.Announcements.list(COURSE_ID, { pageSize: 1 });
    const latest = announcements.announcements && announcements.announcements[0];

    if (!latest) return; 

    const latestId = latest.id;

    if (latestId !== lastId) {
      const text = latest.text || "(no text)";
      const created = latest.creationTime;

      const payload = {
        test: text,
        date: created
      };

      UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      });

      props.setProperty('lastAnnouncementId', latestId);

      Logger.log("Sent announcement: " + latestId);
    } else {
      Logger.log("No new announcements");
    }

  } catch (err) {
    Logger.log("Eror bruh " + err);
  }
}

function doGet() {
  return HtmlService.createHtmlOutput("<h2> Professor Heidi on duty! </h2>");
}
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('checkAnnouncements')
    .timeBased()
    .everyMinutes()
    .create();

  Logger.log("Trigger done");
}
