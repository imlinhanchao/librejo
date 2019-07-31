const Sequelize = require('sequelize');
const config = require('./config').db;
const Op = Sequelize.Op;
const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
};
var sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: config.logging,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    operatorsAliases
});
const ID_TYPE = Sequelize.UUID;
function defineModel(name, attributes, defineAttr = {}) {
    var attrs = {};
    if (!attributes.id) {
        attrs.id = {
            type: ID_TYPE,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        };
    }
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
    attrs.create_time = {
        type: Sequelize.INTEGER,
    };
    attrs.update_time = {
        type: Sequelize.INTEGER,
    };
    return sequelize.define(name, attrs, Object.assign(defineAttr, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeCreate: function (obj) {
                let now = (new Date()).valueOf() / 1000;
                if (obj.isNewRecord) {
                    obj.create_time = now;
                    obj.update_time = now;
                } else {
                    obj.update_time = now;
                }
            },
            beforeBulkCreate: function (records) {
                let now = (new Date()).valueOf() / 1000;
                for (let i in records) {
                    if (records[i].isNewRecord) {
                        records[i].create_time = now;
                        records[i].update_time = now;
                    } else {
                        records[i].update_time = now;
                    }
                }
            },
            beforeUpdate: function (obj) {
                let now = (new Date()).valueOf() / 1000;
                if (obj.isNewRecord) {
                    obj.create_time = now;
                    obj.update_time = now;
                } else {
                    obj.update_time = now;
                }
            }
        }
    }));
}
const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATE', 'ENUM',
    'DATEONLY', 'BOOLEAN', 'NOW', 'fn', 'col'
];
var exp = {
    defineModel: defineModel,
    sync: async () => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({
                force: true
            });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};
for (let type of TYPES) {
    exp[type] = Sequelize[type];
}
exp.ID = ID_TYPE;
exp.bitOp = (field, op, val, eq) => {
    return sequelize.where(sequelize.literal(`${field} ${op} ${val}`), eq);
};
module.exports = exp;