import { expect } from "chai";
import { pool } from './helper/db.js';
import { initializeTestDb, insertTestUser, getToken } from './helper/test.js';
const base_url = 'http://localhost:3001';

// Initialize the database before running tests
before(async () => {
    await initializeTestDb();
});

// GET Tasks
describe('GET Tasks', () => {
  before(async () => {
      await pool.query('DELETE FROM task'); // Clear the `task` table

      // Insert sample tasks
      await pool.query('INSERT INTO task (description) VALUES ($1), ($2)', [
          'Sample task 1',
          'Sample task 2',
      ]);
  });

  it('should get all tasks', async () => {
      const response = await fetch(base_url + '/');
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data).to.be.an('array').that.is.not.empty;
      expect(data[0]).to.include.all.keys('id', 'description');
  });
});

// POST Task
describe('POST /create', () => {
    let token;

    before(async () => {
        await pool.query('DELETE FROM task');
        await pool.query('DELETE FROM account');
        const email = 'post@foo.com';
        const password = 'post123';
        await insertTestUser(email, password);
        token = getToken(email);


                // Debug log to verify the token
                console.log("Generated token:", token);
    });

    it('should post a task', async () => {
        const response = await fetch(`${base_url}/create`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 'description': 'Task from unit test' })
        });

        const data = await response.json();
        console.log("Response data for posting task:", data); // Debug log
        expect(response.status).to.equal(200);
        expect(data).to.be.an('object').that.includes.all.keys('id', 'description');
    });

    it('should not post a task without description', async () => {
        const response = await fetch(`${base_url}/create`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });

        const data = await response.json();
        console.log("Response data for task without description:", data); // Debug log
        expect(response.status).to.equal(400);
        expect(data).to.be.an('object').that.includes.all.keys('error');
    });
});

// DELETE Task
describe('DELETE /delete/:id', () => {
    let taskId;
    let token;

    before(async () => {
        await pool.query('DELETE FROM task');
        await pool.query('DELETE FROM account');
        const email = 'post@foo.com';
        const password = 'post123';
        await insertTestUser(email, password);
        token = getToken(email);

        const response = await fetch(`${base_url}/create`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 'description': 'Task to delete' })
        });

        const data = await response.json();
        taskId = data.id;
    });

    it('should delete a task', async () => {
        const response = await fetch(`${base_url}/delete/${taskId}`, {
            method: 'delete',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data).to.be.an('object').that.includes.all.keys('id');
    });

    it("should not delete a task with SQL injection", async () => {
        const maliciousId = 'invalid_id';
        const response = await fetch(`${base_url}/delete/${maliciousId}`, {
          method: "delete",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        expect(response.status).to.equal(400);
        expect(data).to.be.an("object");
        expect(data).to.include.all.keys("error");
      });
});

// POST Register
describe('POST register', () => {
    before(async () => {
        await pool.query('DELETE FROM account');
    });

    it('should register with valid email and password', async () => {
        const email = 'register@foo.com';
        const password = 'register123';
        const response = await fetch(`${base_url}/user/register`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'email': email, 'password': password })
        });

        const data = await response.json();
        expect(response.status).to.equal(201);
        expect(data).to.be.an('object').that.includes.all.keys('id', 'email');
    });

    it("should not register with less than 8 character password", async () => {
        const email = "short@foo.com";
        const password = "short1";
        const response = await fetch(base_url + "/user/register", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password }),
        });
    
        const data = await response.json();
        expect(response.status).to.equal(400);
        expect(data).to.be.an("object");
        expect(data).to.include.all.keys("error");
      });
});

// POST Login
describe('POST login', () => {
    const email = 'register@foo.com';
    const password = 'register123';

    before(async () => {
        await pool.query('DELETE FROM account');
        await insertTestUser(email, password);
    });

    it('should login with valid credentials', async () => {
        const response = await fetch(`${base_url}/user/login`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'email': email, 'password': password })
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data).to.be.an('object').that.includes.all.keys('id', 'email', 'token');
    });
});
