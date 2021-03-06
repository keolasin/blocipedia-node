const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;


describe("Wiki", () => {
  beforeEach((done) => {
    this.wiki;
    this.user;

    // start with empty database
    sequelize.sync({force: true})
    .then((res) => {
      // create a user object to associate to the wiki page
      User.create({
        name: "Wendy Wiki",
        email: "Burgers@gmail.com",
        password: "Redhair and freckles",
        role: "standard"
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "How to make the perfect burger",
          body: "First, forget everything you know about burgers.",
          private: false,
          userId: this.user.id
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        });
      });
    });
  });

  // tests for CREATE
  describe("#create()", () => {
    // successful creation with correct parameters
    it("should create the wiki object with a title and body", (done) => {
      Wiki.create({
        title: "Stand-up Paddle-boarding",
        body: "The trick to stand-up paddle-boarding is to stand up!",
        userId: this.user.id,
        private: false
      })
      .then((wiki) => {
        expect(wiki.title).toBe("Stand-up Paddle-boarding");
        expect(wiki.body).toBe("The trick to stand-up paddle-boarding is to stand up!");
        expect(wiki.private).toBe(false);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    // bad parameters, unsucssesful creation (missing body)
    it("should NOT create the wiki object if it's missing a title, body, or private boolean", (done) => {
      Wiki.create({
        title: "Cloud Sailing",
        private: true
      })
      .then((wiki) => {
        // this should not evaluate since there will be an error during creation, see catch() for expectation
      })
      .catch((err) => {
        expect(err.message).toContain("Wiki.body cannot be null");
        done();
      });
    });

    it("should NOT create the private wiki object if the user is not a premium member", (done) =>{
      Wiki.create({
        title: "Snail racing",
        body: "Snails actually go faster than one might think",
        userId: this.user.id, // user created above has role of "standard"
        private: true // setting wiki to private
      })
      .then((wiki) => {
        // should not evaluate since the user is "standard" and cannot create private wikis
      })
      .catch((err) => {
        expect(err.message).toContain("You are not authorized to do that.");
        done();
      });
    });
  });

  // tests for getting/setting User
  describe("#setUser()", () => {
    it("should associate a wiki and a user together", (done) => {
      User.create({
        name: "Sally Setter",
        email: "Sally@gmail.com",
        password: "has to be at least 10 characters",
      })
      .then((newUser) => {
        expect(this.wiki.userId).toBe(this.user.id);
        this.wiki.setUser(newUser)
        .then((wiki) => {
          expect(this.wiki.userId).toBe(newUser.id);
          done();
        });
      })
    });
  });

  // getUser test
  describe("#getUser()", () => {
    it("should return the associated user", (done) => {
      this.wiki.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("Burgers@gmail.com");
        done();
      });
    });
  });
});
