import { v2 as cloudinary } from "cloudinary";

// TEMPORARY: Hardcode your credentials to see if the error persists
cloudinary.config({
  cloud_name: "djeebhqbg", 
  api_key: "183541261672663", 
  api_secret: "OmxXm_xHiuNwLbZZSwb363Buwcg" 
});

console.log("Cloudinary Config Verified:", cloudinary.config().api_key);

export default cloudinary;