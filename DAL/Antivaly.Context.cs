using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;

namespace DAL
{
    public partial class AntivalyEntities : DbContext
    {
        public AntivalyEntities()
            : base("name=AntivalyEntities")
        {
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Custom configurations can be added here if needed.
            // For now, this can remain empty if no specific model configurations are required.
        }

        public DbSet<Buyer> Buyers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<CouponCheck> CouponChecks { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<UserID> UserIDs { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
