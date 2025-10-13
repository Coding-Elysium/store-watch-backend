export const addTeam = async(req, res) => {
    try {
        const { teamName } = req.body;

        res.status(200).json({
            message: "Success added a team.",
        });
    } catch (error) {
        console.error("Error in takeOverSchedule:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}