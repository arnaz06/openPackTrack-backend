const paginate = require('express-paginate')
let sequelize = require('sequelize')
const Op = sequelize.Op


let models = require('../models')

module.exports = {
  create: function(req,res){
    var result= {
      success: false,
      status: "ERROR",
      carton: null
    }
    models.Carton.create({
      barcode: req.body.barcode,
      warehouseId: req.body.warehouseId,
      profileId: req.body.profileId
    }).then(carton=>{
      result.success = true
      result.status = "OK"
      result.carton = carton
      res.json(result)
    }).catch(err=>{
      console.log('Error when trying to create new carton : ', err)
      if (err.errors) {
        result.errors = err.errors
      }
      res.json(result)
    })
  },
  all: function (req, res) {
    var result= {
      success: false
    }
    var allowedSort = ['updatedAt', 'barcode']
    if (allowedSort.indexOf(req.query.sortBy) == -1) {
      req.query.sortBy = 'updatedAt'
    }
    var allowedDirection = ['ASC', 'DESC']
    if (req.query.sortDirection) {
      req.query.sortDirection = req.query.sortDirection.toUpperCase()
    }
    if (allowedDirection.indexOf(req.query.sortDirection) == -1) {
      req.query.sortDirection = 'ASC'
    }
    if (req.query.search == null) {
      req.query.search = ''
    }
    var text = req.query.search
    console.log(req.query);
    models.Carton.findAndCountAll({
        include: [
          {
            model: models.Profile,
            as: 'profile',
            attributes: {
              exclude: ["createdAt", "updatedAt"]
            }
          },
          {
            model: models.Warehouse,
            as:'warehouse',
            attributes: {
              exclude: ["createdAt", "updatedAt"]
              }
            }
        ],
        attributes:{
          exclude:["profileId","warehouseId"]
        },
        where: {
          $or: [
            // https://stackoverflow.com/questions/33271413/sequelize-or-clause-with-multiple-models
            sequelize.where(sequelize.col('Carton.barcode'), { $ilike: `%${text}%`}),
            // sequelize.where(sequelize.col('profile.type'), { $ilike: `%${text}%`})
          ]
        },
        limit: req.query.limit,
        offset: req.skip,
        order: [[req.query.sortBy, req.query.sortDirection]]
      }
    )
    .then(data=>{
      var carton = data.rows
      var cartonCount = data.count
      pageCount = Math.ceil(cartonCount / req.query.limit)
      result.success= true
      result.status= "OK"
      result.pagination = {
        total: cartonCount,
        pageCount: pageCount,
        currentPage: req.query.page,
        hasNextPage: paginate.hasNextPages(req)(pageCount),
        hasPrevPage: res.locals.paginate.hasPreviousPages
      }
      result.cartons = carton
      res.json(result)
    })
    .catch(err=>{
      console.log('Error when trying to show all carton : ', err);
      if (err.errors) {
        result.errors = err.errors
      }
      if (err.message) {
        result.message = err.message
      }
      res.json(result)
    })
  },

  detail: function(req, res){
    var result = {
      success: false,
      carton: null
    }
    models.Carton.find({
      where: {
        barcode: req.params.barcode
      }
    })
    .then(carton=>{
      if (carton) {
        result.success = true
        result.carton = carton
        res.json(result)
      }
      else {
        result.message = 'carton not found'
        res.json(result)
      }
    })
    .catch(err=>{
      if (err.errors) {
        result.errors = err.errors
      }
      else {
        result.error = err
      }
      res.json(result)
    })
  },

  ping: function(req, res){
    var result = {
      success: false
    }
    models.Carton.find({
      where: {
        barcode: req.params.barcode
      }
    })
    .then(carton=>{
      result.success = true
      if (carton) {
        result.exist = true
      }
      else {
        result.exist = false
      }
      res.json(result)
    })
    .catch(err=>{
      if(err.errors){
        result.errors = err.errors
      }
      else {
        result.errors = err
      }
      res.json(result)
    })
  },
  repack: function(req,res){
    let result={
      success: false
    }
    if(req.body.barcode&&req.body.warehouseId&&req.body.profileId&&req.body.repackCartonId){
      models.sequelize.transaction(function(t){
        return models.Carton.create({
          barcode: req.body.barcode,
          warehouseId: req.body.warehouseId,
          profileId: req.body.profileId
        },{
          transaction:t
        }).then((carton) => {
          let repackCartonId=JSON.parse(req.body.repackCartonId)
          return models.Inner.findAndCountAll({
            where:{
              cartonId:{
                [Op.in]:repackCartonId
              }
            }
          }).then((inners)=>{
            if(inners.count<12){
              let innerIds= inners.rows.map(inner=>{
                return inner.id
              })
              models.Inner.update(
                {cartonId: carton.id},
                {where:{id:{[Op.in]:innerIds}}}
              ).then(updated=>{
                result.success= true
                result.message='repack success'
                res.json(result)
              })
            }else{
              result.message='inner more than 12'
              res.json(result)
            }
          })
        })
      }).catch((err) => {
        console.log(err);
        result.message=err.message
        res.json(result)
      })
    }else{
      result.message='required parameters'
      res.status(422).json(result)
    }
  }
}
