const axios = require('axios');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

async function sendDiscordNotification(task, user) {
    if (!DISCORD_WEBHOOK_URL) {
        console.log('Discord webhook URL not configured');
        return;
    }

    const priorityColors = {
        'Easy': 0x00ff00,    // Green
        'Medium': 0xffff00,  // Yellow
        'Hard': 0xff0000     // Red
    };

    const embed = {
        title: '📋 Task Reminder',
        description: task.taskName,
        color: priorityColors[task.priority] || 0x808080,
        fields: [
            {
                name: 'Priority',
                value: task.priority,
                inline: true
            },
            {
                name: 'Due Date',
                value: new Date(task.dueDate).toLocaleDateString(),
                inline: true
            },
            {
                name: 'Category',
                value: task.category.name,
                inline: true
            }
        ],
        footer: {
            text: `Assigned to ${user.name}`
        },
        timestamp: new Date().toISOString()
    };

    const message = {
        content: `<@${user.discordId}>`,
        embeds: [embed]
    };

    try {
        await axios.post(DISCORD_WEBHOOK_URL, message);
        console.log(`Discord notification sent for task: ${task.taskName}`);
    } catch (error) {
        console.error('Error sending Discord notification:', error.message);
    }
}

module.exports = { sendDiscordNotification };