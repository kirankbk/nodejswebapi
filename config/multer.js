/**********************************************************************
 * HRMS Employee Photo Upload Configuration
 * File : config/multer.js
 **********************************************************************/

 const multer = require("multer");
 const path = require("path");
 const fs = require("fs");
 const { v4: uuidv4 } = require("uuid");
 
 /**********************************************************************
  * Upload Folder
  **********************************************************************/
 
 const uploadDirectory = path.join(
     process.cwd(),
     "uploads",
     "employees"
 );
 
 /**********************************************************************
  * Create Folder Automatically
  **********************************************************************/
 
 if (!fs.existsSync(uploadDirectory)) {
 
     fs.mkdirSync(uploadDirectory, {
 
         recursive: true
 
     });
 
 }
 
 /**********************************************************************
  * Allowed Image Types
  **********************************************************************/
 
 const allowedMimeTypes = [
 
     "image/jpeg",
 
     "image/jpg",
 
     "image/png",
 
     "image/webp"
 
 ];
 
 /**********************************************************************
  * Storage Configuration
  **********************************************************************/
 
 const storage = multer.diskStorage({
 
     destination(req, file, callback) {
 
         callback(
 
             null,
 
             uploadDirectory
 
         );
 
     },
 
     filename(req, file, callback) {
 
         const extension =
             path.extname(file.originalname);
 
         const fileName =
 
             "EMP_" +
 
             Date.now() +
 
             "_" +
 
             uuidv4() +
 
             extension.toLowerCase();
 
         callback(
 
             null,
 
             fileName
 
         );
 
     }
 
 });