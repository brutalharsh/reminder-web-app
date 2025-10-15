const Category = require('../models/Category');

async function initializeDatabase() {
    try {
        // Create special categories if they don't exist
        const specialCategories = [
            { name: 'Completed Tasks', isSpecial: true, isDeletable: false },
            { name: 'Deleted Tasks', isSpecial: true, isDeletable: false }
        ];

        for (const categoryData of specialCategories) {
            const existingCategory = await Category.findOne({ name: categoryData.name });
            if (!existingCategory) {
                await Category.create(categoryData);
                console.log(`Created special category: ${categoryData.name}`);
            }
        }

        // Create default category if no categories exist
        const categoryCount = await Category.countDocuments({ isSpecial: false });
        if (categoryCount === 0) {
            await Category.create({ name: 'General', isSpecial: false, isDeletable: true });
            console.log('Created default category: General');
        }

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

module.exports = initializeDatabase;