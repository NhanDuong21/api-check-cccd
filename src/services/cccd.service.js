const provinceCodes = require('../data/provinceCodes');

/**
 * Validates and extracts details from a Vietnamese CCCD number format.
 * Note: This only validates format, not real-world citizen database existence.
 * 
 * @param {any} cccdInput 
 * @returns {Object} Validation outcome containing status, extracted attributes, or error messages.
 */
const validateCCCD = (cccdInput) => {
  // 1. CCCD must exist in request body.
  if (cccdInput === undefined || cccdInput === null) {
    return {
      valid: false,
      message: "CCCD is required"
    };
  }

  // 2. CCCD must be string-convertible.
  let cccdStr = '';
  if (typeof cccdInput === 'object') {
    return {
      valid: false,
      message: "CCCD must be a string or convertible to string"
    };
  }

  try {
    cccdStr = String(cccdInput);
  } catch (err) {
    return {
      valid: false,
      message: "CCCD must be a string or convertible to string"
    };
  }

  // 3. Trim whitespace before checking.
  cccdStr = cccdStr.trim();

  if (cccdStr === "") {
    return {
      valid: false,
      message: "CCCD is required"
    };
  }

  // 4. CCCD must contain exactly 12 digits.
  const digitsRegex = /^\d{12}$/;
  if (!digitsRegex.test(cccdStr)) {
    return {
      valid: false,
      message: "CCCD must contain exactly 12 digits"
    };
  }

  // 5. First 3 digits are province code.
  const provinceCode = cccdStr.substring(0, 3);
  const provinceName = provinceCodes[provinceCode];
  if (!provinceName) {
    return {
      valid: false,
      message: "Invalid province code"
    };
  }

  // 6. 4th digit is gender + century code.
  const genderCenturyChar = cccdStr.charAt(3);
  const genderCenturyVal = parseInt(genderCenturyChar, 10);
  
  if (genderCenturyVal < 0 || genderCenturyVal > 5 || isNaN(genderCenturyVal)) {
    return {
      valid: false,
      message: "Invalid gender and century code"
    };
  }

  // Century mapping:
  // 0 = Male, born 1900–1999
  // 1 = Female, born 1900–1999
  // 2 = Male, born 2000–2099
  // 3 = Female, born 2000–2099
  // 4 = Male, born 2100–2199
  // 5 = Female, born 2100–2199
  let gender = "";
  let genderLabel = "";
  let centuryStartYear = 1900;

  if (genderCenturyVal === 0 || genderCenturyVal === 2 || genderCenturyVal === 4) {
    gender = "MALE";
    genderLabel = "Nam";
  } else {
    gender = "FEMALE";
    genderLabel = "Nữ";
  }

  if (genderCenturyVal === 0 || genderCenturyVal === 1) {
    centuryStartYear = 1900;
  } else if (genderCenturyVal === 2 || genderCenturyVal === 3) {
    centuryStartYear = 2000;
  } else if (genderCenturyVal === 4 || genderCenturyVal === 5) {
    centuryStartYear = 2100;
  }

  // 7. 5th and 6th digits are last two digits of birth year.
  const birthYearSuffixStr = cccdStr.substring(4, 6);
  const birthYearSuffix = parseInt(birthYearSuffixStr, 10);
  const birthYear = centuryStartYear + birthYearSuffix;

  // 8. If birth year is greater than current year, return invalid.
  const currentYear = new Date().getFullYear();
  if (birthYear > currentYear) {
    return {
      valid: false,
      message: "Birth year cannot be in the future"
    };
  }

  // 9. Age should be calculated by currentYear - birthYear.
  const ageByYear = currentYear - birthYear;

  // 10. Last 6 digits are random identifier code.
  const randomCode = cccdStr.substring(6, 12);

  // 11. Mask CCCD as first 3 digits + ****** + last 3 digits.
  const cccdMasked = `${cccdStr.substring(0, 3)}******${cccdStr.substring(9, 12)}`;

  // Return success response object
  return {
    valid: true,
    cccdMasked,
    provinceCode,
    provinceName,
    gender,
    genderLabel,
    birthYear,
    ageByYear,
    randomCode,
    message: "CCCD format is valid",
    note: "This API only checks CCCD format. It does not verify whether the CCCD exists in the national citizen database."
  };
};

module.exports = {
  validateCCCD
};
