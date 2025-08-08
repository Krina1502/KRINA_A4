
export const validateEmail = (email) => {
    if (!email || !email.includes('@')) {
      return 'Please enter a valid email address.';
    }
    return null;
  };
  
  export const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return null;
  };
  
  export const validateConfirmPassword = (password, confirm) => {
    if (password !== confirm) {
      return 'Passwords do not match.';
    }
    return null;
  };
  
  export const validateEventForm = ({ title }) => {
    if (!title || title.trim().length === 0) {
      return 'Title is required.';
    }
    return null;
  };
  