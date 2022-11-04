const mongoose = require("mongoose");
const app = require("../index");
const supertest = require("supertest");
const api = supertest(app);
const User = require("../models/User");
const check = require("./test_check");

beforeEach(async () => {
  await User.deleteMany({});
});

describe("check environment variables", () => {
  test("check that node environment is test", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});

describe("post request to api/user", () => {
  test("with correct details successfully creates a user", async () => {
    const newUser = {
      firstName: "User",
      lastName: "One",
      username: "user1",
      email: "user1@mail.com",
      password: "password",
    };

    const usersInDbBefore = await check.usersInDb();
    const response = await api
      .post("/api/user")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersInDbAfter = await check.usersInDb();
    expect(usersInDbBefore.length).toBe(usersInDbAfter.length - 1);

    expect(Object.keys(response.body.data)).not.toContain("password");
  });

  test("with incorrect details returns an error", async () => {
    const newUser = {
      firstName: "User",
      lastName: "One",
      username: "user1",
      email: "user1@mail.com",
    };

    const usersInDbBefore = await check.usersInDb();
    await api
      .post("/api/user")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersInDbAfter = await check.usersInDb();
    expect(usersInDbBefore.length).toBe(usersInDbAfter.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
