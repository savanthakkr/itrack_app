import moment from 'moment-timezone';

export const getDate = originalDateString => {
  if (!originalDateString) {
    return '';
  }
  const date = new Date(originalDateString);

  // Extract the date part (YYYY-MM-DD) from the Date object
  const formattedDate = date.toISOString().split('T')[0];

  // Return the formatted date
  return formattedDate;
};

export const getCurrentDate = () => {
  const date = new Date();

  // Extract the date part (YYYY-MM-DD) from the Date object
  const formattedDate = date.toISOString().split('T')[0];

  // Return the formatted date
  return formattedDate;
};

export const getFormattedDAndT = date => {
  if (!date) return '';
  const [datePart, timePart] = date.split('T');
  const [year, month, day] = datePart.split('-');
  const [hours, minutes] = timePart.slice(0, 5).split(':');

  // Convert 24-hour time to 12-hour time
  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'pm' : 'am';

  // Format date parts
  const formattedDate = `${day}/${month}/${year}, ${hours12
    .toString()
    .padStart(2, '0')}:${minutes} ${ampm}`;

  return formattedDate;
};

export const getLocalDateAndTime = date => {
  const dateObj = new Date(date);

  // Format date parts like 'dd/mm/yyyy, hh:mm am/pm'
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  let hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // Convert 24-hour time to 12-hour time

  const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  return formattedDate;
};
export const convertToMelbourneFormat = dateTime => {
  if (!dateTime) return 'Invalid Date'; // Check if the dateTime is valid
  return moment(dateTime).format('DD/MM/YYYY HH:mm:ss'); // Return in the desired format
};
