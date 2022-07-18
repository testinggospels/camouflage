(() => {
    this.logger.info("inside middleware")
    this.app.use("/api/v1", this.allRoutes)
})();