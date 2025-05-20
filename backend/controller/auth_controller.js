import User from "../dbmodel/auth_model.js";

export const login = async (req, res) => {
  res.send("User attempting to log in");
}
export const register = async (req, res) => {
  const {firstname, lastname, middlename, email, password, username, address} = req.body

  const existEmail = await User.findOne({email})
  const existUsername = await User.findOne({username})

  if(existEmail){
    return res.status(400).json({sucess: false, message: "Email is already in use"});
  }
  else if(existUsername){
    return res.status(400).json({sucess: flase, messsage: "Username already in use"});
  }
  else{
    const user = await User.create({firstname, lastname, middlename, email, password, username, address})

  }
}
export const logout = async (req, res) => {
  res.send("User attempting to log out");
}