let models = require('../models')

module.exports = {
  usersWithRoles: function(req, res, next){
    let mongo = req.app.get('mongo')
    models.User.findAll()
    .then(users=>{
      let allUsers = []
      mongo.collection("users").find({}).toArray((err, userRoles)=>{
        for (var i in users) {
          let someone = {
            name: users[i].name,
            username: users[i].username,
            hasRole: false,
            roles: []
          }
          for (var j in userRoles) {
            if (userRoles[j].key == users[i].id) {
              someone.hasRole = true
              someone.roles.push(Object.keys(userRoles[j]).slice(2))
            }
          }
          allUsers.push(someone)
        }
        res.json({
          success: true,
          users: allUsers
        })
      })
    })
  },

  // tambah role
  addRole: function(req, res, next){
    let acl = req.app.get('acl')
    if (req.body.rolename && req.body.permissions) {
      acl.whatResources(req.body.rolename, (err, resources)=>{
        console.log(resources);
        if (!Object.keys(resources).length) {
          console.log("yes, the role not exist yet");
          let newAcl = {
            roles: req.body.rolename.toUpperCase(),
          }
          try {
            newAcl.allows = JSON.parse(req.body.permissions)
          } catch (e) {
            res.json({
              success: false,
              message: "Invalid JSON for permissions"
            })
          }
          console.log(JSON.stringify(newAcl));
          acl.allow([newAcl], err=>{
            if (err) {
              res.json({
                success: false,
                message: err
              })
            }
            else {
              res.json({
                success: true,
                message: "berhasil menambahkan role",
                permissions: newAcl
              })
            }
          })
        }
        else {
          res.json({
            success: false,
            message: "role already exist"
          })
        }
      })

    }
    else {
      res.json({
        success: false,
        message: "missing parameter(s)"
      })
    }
  },

  // menghapus role dari ACL
  removeRole: function(req, res, next){
    let acl = req.app.get('acl')
    if (req.body.role) {
      acl.removeRole(req.body.role, err=>{

      })
    }
    else {
      res.json({
        success: false,
        message: "missing parameter(s)"
      })
    }
  },

  // assign role ke user
  addRoleToUser: function(req, res, next){
    let acl = req.app.get('acl')
    if (req.body.role && req.body.userId) {
      models.User.findById(req.body.userId).then(user=>{
        if (user) {
          acl.addUserRoles(req.body.userId, req.body.role, err=>{
            if (err) {
              res.json({
                success: false,
                errors: err
              })
            }
            else {
              res.json({
                success: true,
                message: "role successfully assigned to user",
                user: {
                  username: user.username,
                  name: user.name
                }
              })
            }
          })
        }
        else {
          res.json({
            success: false,
            message: "User not found",
          })
        }
      })

    }
    else {
      res.json({
        success: false,
        message: "missing parameter(s)",
      })
    }
  },

  // hapus role dari user
  removeRoleFromUser: function(req, res, next){
    let acl = req.app.get('acl')
    if (req.body.role && req. body.userId) {
      models.User.findById(req.body.userId).then(user=>{
        if (user) {
          acl.removeUserRoles(req.body.userId, req.body.role, err=>{
            if (err) {
              res.json({
                success: false,
                errors: err
              })
            }
            else {
              res.json({
                success: true,
                message: "role successfully removed from user"
              })
            }
          })
        }
        else {
          res.json({
            success: false,
            message: "User not found"
          })
        }
      })
    }
    else {
      res.json({
        success: false,
        message: "missing parameter(s)",
      })
    }
  },

}
