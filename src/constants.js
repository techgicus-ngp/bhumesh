// Original hard-coded id of the map that uses the Google Maps satellite viewer (employee_home.dart)
// export const GOOGLE_MAPS_DOC_ID ='5piN2m5H5Jmjleod5YSe'

// after
export const GOOGLE_MAPS_DOC_IDS = [
  "5piN2m5H5Jmjleod5YSe",        // paste each full doc ID
  "qgq4RdXf8pQq76TMqPEg",
  ,
];
export const isGoogleMapDoc = (id) => GOOGLE_MAPS_DOC_IDS.includes(id);