import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const superSecretKey = 'IchBinEinSuperSchweresUndUnknackbaresPasswort!'

console.log(superSecretKey)

const Schema = mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  tokens: [String]
})

// Static methods

Schema.statics.findByEmail = function (email) {
  return User.findOne().where('email').equals(email)
}

Schema.statics.findByAuthToken = function (token){
  const decode = jwt.verify(token, superSecretKey)
  return User.findById(decode._id).where('tokens').equals(token)
}


// Instance methods
Schema.methods.generateAuthToken = function () {
  const user = this
  const token = jwt
    .sign({_id: user._id}, superSecretKey, {expiresIn: '2h'})
    .toString()
   
    user.tokens.push(token)
  
 return token
}

Schema.methods.checkPassword = async function (password) {
  const user = this
  return await bcrypt.compare(password, user.password)
}

Schema.methods.toJSON = function (){
  const user = this
  const result = {
    name: user.name,
    email: user.email,
    _id: user._id,
    tokens: user.tokens

  }
  return result
}



Schema.pre('save', async function (next) {
  const user = this
  if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10)
  }

  next()
})


const User = mongoose.model('User', Schema, 'users')

export default User