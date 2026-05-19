'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventCode: {
        type: Sequelize.STRING,
        unique: true
      },
      title: {
        type: Sequelize.STRING
      },
      organizer: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      venueName: {
        type: Sequelize.STRING
      },
      venueAddress: {
        type: Sequelize.STRING
      },
      venueMapLink: {
        type: Sequelize.STRING
      },
      priceAmount: {
        type: Sequelize.FLOAT
      },
      priceCurrency: {
        type: Sequelize.STRING
      },
      isEarlyBird: {
        type: Sequelize.BOOLEAN
      },
      capacityTotal: {
        type: Sequelize.INTEGER
      },
      capacityRemaining: {
        type: Sequelize.INTEGER
      },
      eventDate: {
        type: Sequelize.DATE
      },
      shortDescription: {
        type: Sequelize.TEXT
      },
      fullDescription: {
        type: Sequelize.TEXT
      },
      agenda: {
        type: Sequelize.JSON
      },
      prerequisites: {
        type: Sequelize.JSON
      },
      tags: {
        type: Sequelize.JSON
      },
      userId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      city: { type: Sequelize.STRING, allowNull: true },
      state: { type: Sequelize.STRING, allowNull: true },
      indoorOutdoor: { type: Sequelize.ENUM('indoor', 'outdoor'), allowNull: true },
      specialCategories: { type: Sequelize.JSON, allowNull: true },
      guestList: { type: Sequelize.STRING, allowNull: true },
      ticketType: { type: Sequelize.STRING, allowNull: true },
      numberOfTickets: { type: Sequelize.INTEGER, allowNull: true },
      budgetRange: { type: Sequelize.STRING, allowNull: true },
      eventTimeStart: { type: Sequelize.STRING, allowNull: true },
      eventTimeEnd: { type: Sequelize.STRING, allowNull: true },
      eventDuration: { type: Sequelize.STRING, allowNull: true },
      cateringRequired: { type: Sequelize.BOOLEAN, defaultValue: false },
      decorationServices: { type: Sequelize.BOOLEAN, defaultValue: false },
      photography: { type: Sequelize.BOOLEAN, defaultValue: false },
      musicDJ: { type: Sequelize.BOOLEAN, defaultValue: false },
      equipment: { type: Sequelize.JSON, allowNull: true },
      customRequirements: { type: Sequelize.TEXT, allowNull: true },
      accessibilityNeeds: { type: Sequelize.TEXT, allowNull: true },
      dietaryRestrictions: { type: Sequelize.TEXT, allowNull: true },
      paymentMethod: { type: Sequelize.ENUM('card', 'upi', 'cash'), allowNull: true },
      advancePayment: { type: Sequelize.FLOAT, allowNull: true },
      billingAddress: { type: Sequelize.TEXT, allowNull: true },
      promoCode: { type: Sequelize.STRING, allowNull: true },
      referralSource: { type: Sequelize.STRING, allowNull: true },
      fileUpload: { type: Sequelize.STRING, allowNull: true },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events');
  }
};