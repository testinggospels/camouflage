from locust import task, HttpUser, between


class VUser(HttpUser):
    host = "http://localhost:8080"
    wait_time = between(0.3, 0.6)

    @task
    def hello_world(self):
        self.client.get("/hello-world")
        self.client.get("/hello-world?name=John")
        payload = {
            "firstName": "Robert",
            "lastName": "Downey",
            "nicknames": [
                {
                    "nickname": "Bob",
                },
                {
                    "nickname": "Rob",
                },
            ],
        }
        self.client.post("/hello-world", json=payload)

    @task
    def note(self):
        self.client.get("/note")

    @task
    def users(self):
        self.client.get("/users")
        self.client.get("/users/get/1293?name=John")
        payload = {
            "firstName": "John",
            "lastName": "Doe",
        }
        self.client.post("/users/get/1293", json=payload)
    
    @task
    def code(self):
        self.client.get("/code")
        self.client.get("/code/inject")
    
    @task
    def csv(self):
        self.client.get("/csv")