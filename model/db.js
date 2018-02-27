const Sequelize = require('sequelize');
const config = require('./config').db;
console.log('init sequelize...');
var sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: true,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});
const ID_TYPE = Sequelize.UUID;
function defineModel(name, attributes, defineAttr = {}) {
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    if (!attrs.id) {
        attrs.id = {
            type: ID_TYPE,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        };
    }
    attrs.create_time = {
        type: Sequelize.INTEGER,
        defaultValue: Sequelize.NOW,
        allowNull: false
    };
    attrs.update_time = {
        type: Sequelize.INTEGER,
        defaultValue: Sequelize.NOW,
        allowNull: false
    };
    console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function (k, v) {
        if (k === 'type') {
            for (let key in Sequelize) {
                if (key === 'ABSTRACT' || key === 'NUMBER') {
                    continue;
                }
                let dbType = Sequelize[key];
                if (typeof dbType === 'function' && dbType.key) {
                    if (v instanceof dbType) {
                        if (v._length) {
                            return `${dbType.key}(${v._length})`;
                        }
                        return dbType.key;
                    }
                    if (v === dbType) {
                        return dbType.key;
                    }
                }
            }
        }
        return v;
    }, '  '));
    return sequelize.define(name, attrs, Object.assign(defineAttr, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeCreate: function (obj) {
                let now = (new Date()).valueOf();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    obj.create_time = now;
                    obj.update_time = now;
                } else {
                    console.log('will update entity...');
                    obj.update_time = now;
                }
            },
            beforeUpdate: function (obj) {
                let now = (new Date()).valueOf();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    obj.create_time = now;
                    obj.update_time = now;
                } else {
                    console.log('will update entity...');
                    obj.update_time = now;
                }
            }
        }
    }));
}
const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATE', 'ENUM',
    'DATEONLY', 'BOOLEAN', 'NOW', "fn", "col"];
var exp = {
    defineModel: defineModel,
    sync: () => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            sequelize.sync({ force: true });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};
for (let type of TYPES) {
    exp[type] = Sequelize[type];
}
exp.ID = ID_TYPE;
module.exports = exp;