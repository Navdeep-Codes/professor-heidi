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
      const authorId = latest.creatorUserId;

      let authorName = "Unknown Author";
      try {
        const user = Classroom.UserProfiles.get(authorId);
        authorName = user.name.fullName || authorName;
      } catch (err) {
        Logger.log("Author fetch failed: " + err);
      }

      let attachments = [];
      if (latest.materials && latest.materials.length > 0) {
        latest.materials.forEach(m => {
          if (m.driveFile && m.driveFile.driveFile && m.driveFile.driveFile.alternateLink) {
            attachments.push(m.driveFile.driveFile.alternateLink);
          } else if (m.link && m.link.url) {
            attachments.push(m.link.url);
          } else if (m.youtubeVideo && m.youtubeVideo.alternateLink) {
            attachments.push(m.youtubeVideo.alternateLink);
          }
        });
      }

      const payload = {
        text: text,
        date: created,
        author: authorName,
        attachments: attachments
      };

      UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      props.setProperty('lastAnnouncementId', latestId);

      Logger.log("Sent announcement: " + latestId);
    } else {
      Logger.log("No new announcements");
    }

  } catch (err) {
    Logger.log("Error bruh: " + err);
  }
}

function doGet() {
  return HtmlService.createHtmlOutput("<h2>Professor Heidi on duty!</h2>");
}

function setupTrigger() {
  ScriptApp.newTrigger('checkAnnouncements')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log("Trigger created to run every 1 minute.");
}
