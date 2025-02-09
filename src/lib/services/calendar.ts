import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: "hangoutsMeet";
      };
    };
  };
}

const calendar = google.calendar("v3");

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const addEventToCalendar = async (event: CalendarEvent) => {
  try {
    const response = await calendar.events.insert({
      auth: oAuth2Client,
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding event to calendar:", error);
    throw new Error("שגיאה בהוספת האירוע ללוח השנה");
  }
};

export const getUpcomingEvents = async (maxResults = 10) => {
  try {
    const response = await calendar.events.list({
      auth: oAuth2Client,
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw new Error("שגיאה בטעינת האירועים הקרובים");
  }
};

export const updateEvent = async (
  eventId: string,
  updates: Partial<CalendarEvent>,
) => {
  try {
    const response = await calendar.events.patch({
      auth: oAuth2Client,
      calendarId: "primary",
      eventId,
      requestBody: updates,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("שגיאה בעדכון האירוע");
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    await calendar.events.delete({
      auth: oAuth2Client,
      calendarId: "primary",
      eventId,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("שגיאה במחיקת האירוע");
  }
};
