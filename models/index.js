'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const db = {};
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// auto load all model files in this folder
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// run associations if defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// associations
db.User.hasMany(db.Event, { foreignKey: 'userId' });
db.Event.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Registration, { foreignKey: 'userId' });
db.Registration.belongsTo(db.User, { foreignKey: 'userId' });

db.Event.hasMany(db.Registration, { foreignKey: 'eventId' });
db.Registration.belongsTo(db.Event, { foreignKey: 'eventId' });

db.User.hasMany(db.Notification, { foreignKey: 'userId' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;