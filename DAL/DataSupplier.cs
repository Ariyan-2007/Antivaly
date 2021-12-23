using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class DataSupplier
    {
        static AntivalyEntities db;
        static DataSupplier()
        {
            db = new AntivalyEntities();
        }

        public static IRepository<Buyer, string> BuyerDataAccess() { return new BuyerRepo(db); }
        public static IRepository<Category, string> CategoryDataAccess() { return new CategoryRepo(db); }
        public static IRepository<CouponCheck, int> CouponCheckDataAccess() { return new CouponCheckRepo(db); }
        public static IRepository<Coupon, string> CouponDataAccess() { return new CouponRepo(db); }
        public static IRepository<Delivery, string> DeliveryDataAccess() { return new DeliveryRepo(db); }
        public static IProductRepository<Product, int> ProductDataAccess() { return new ProductRepo(db); }
        public static IRepository<Token, string> TokenDataAccess() { return new TokenRepo(db); }
        public static ITransactionRepository<Transaction, int> TransactionDataAccess() { return new TransactionRepo(db); }
        public static IRepository<UserID, int> UserIdDataAccess() { return new UserIdRepo(db); }
        public static IRepository<User, string> UserDataAccess() { return new UserRepo(db); }
        public static IAuth AuthDataAccess() { return new AuthRepo(db); }
    }
}
