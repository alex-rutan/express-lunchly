"use strict";

/** Reservation for Lunchly */

const moment = require("moment");
const { ForbiddenError } = require("../expressError");
const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for most recent reservation startAt */

  getMostRecentStartAt() {
    return moment(this.startAt, "MMMM Do YYYY, h:mm a").fromNow();
  }


  /** formatter for startAt */

  getFormattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1
           ORDER BY start_at DESC`,
        [customerId],
    );

    return results.rows.map(row => new Reservation(row));
  }

  // /** notes getter */
  // get notes() {
  //   return this._notes;
  // }

  // /** notes setter */
  // set notes(notes) {
  //   if (!notes) notes = "";
  //   this._notes = notes;
  // }

  // /** numGuests getter */
  // get numGuests() {
  //   return this._numGuests;
  // }

  // /** numGuests setter */
  // set numGuests(numGuests) {
  //   if (numGuests < 1) throw new ForbiddenError("Need at least 1 guest");
  //   this._numGuests = numGuests;
  // }

  // /** startAt getter */
  // get startAt() {
  //   return this._startAt;
  // }

  // /** startAt setter */
  // set startAt(startAt) {
  //   try {
  //     this._startAt = new Date(startAt);
  //   } catch {
  //     throw new ForbiddenError("Must pass in a correct Date");
  //   }
  // }

  // /** customerId getter */
  // get customerId() {
  //   return this._customerId;
  // }

  // /** customerId setter */
  // set customerId(customerId) {
  //   if (this._customerId && customerId !== this._customerId) {
  //     throw new ForbiddenError("You cannot change a reservation's customer");
  //   }
  //   this._customerId = customerId;
  // }

  /** save this reservation. */

  async save(customerId) {
    if (this.id === undefined) {
      const result = await db.query(
            `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
              VALUES ($1, $2, $3, $4)
              RETURNING id, customer_id`,
          [customerId, this.startAt, this.numGuests, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
            `UPDATE reservations
              SET start_at=$1,
                  num_guests=$2,
                  notes=$3
              WHERE id = $4`, [
            this.startAt,
            this.numGuests,
            this.notes,
            this.id,
          ],
      );
    }
  }
}


module.exports = Reservation;
