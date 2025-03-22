import Player from '../database/models/player.model.js';

// Create a new player
export const createPlayer = async (req, res) => {
    const { username, password } = req.body;
    try {
        const newPlayer = new Player({ username, password });
        await newPlayer.save();
        res.status(201).json({ message: 'Player created successfully', playerId: newPlayer._id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating player', error });
    }
};

// Get player data
export const getPlayer = async (req, res) => {
    const { id } = req.params;
    try {
        const player = await Player.findById(id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving player data', error });
    }
};

// Update player data
export const updatePlayer = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(updatedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error updating player data', error });
    }
};

// Delete player
export const deletePlayer = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPlayer = await Player.findByIdAndDelete(id);
        if (!deletedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting player', error });
    }
};