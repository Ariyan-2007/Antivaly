using AutoMapper;
using BEL;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace BLL
{
    public class TransactionService
    {
        static TransactionService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>();
                cfg.CreateMap<BuyerModel, Buyer>();
                cfg.CreateMap<Category, CategoryModel>();
                cfg.CreateMap<CategoryModel, Category>();
                cfg.CreateMap<Coupon, CouponModel>();
                cfg.CreateMap<CouponModel, Coupon>();
                cfg.CreateMap<Token, TokenModel>();
                cfg.CreateMap<TokenModel, Token>();
                cfg.CreateMap<User, UserModel>();
                cfg.CreateMap<UserModel, User>();
                cfg.CreateMap<UserID, UserIdModel>();
                cfg.CreateMap<UserIdModel, UserID>();
                cfg.CreateMap<Delivery, DeliveryModel>();
                cfg.CreateMap<DeliveryModel, Delivery>();
                cfg.CreateMap<Transaction, TransactionModel>();
                cfg.CreateMap<TransactionModel, Transaction>();
                cfg.CreateMap<Product, ProductModel>();
                cfg.CreateMap<ProductModel, Product>();
            });
        }

        public static void Create(TransactionModel b)
        {
            var data = Mapper.Map<Transaction>(b);
            DataSupplier.TransactionDataAccess().Add(data);
        }

        public static void Edit(TransactionModel b)
        {
            var data = Mapper.Map<Transaction>(b);
            DataSupplier.TransactionDataAccess().Edit(data);
        }

        public static void Delete(int id)
        {
            DataSupplier.TransactionDataAccess().Delete(id);
        }

        public static List<TransactionModel> Get()
        {
            var data = Mapper.Map<List<TransactionModel>>(DataSupplier.TransactionDataAccess().Get());
            return data;
        }
        public static TransactionModel Get(int id)
        {
            var data = Mapper.Map<TransactionModel>(DataSupplier.TransactionDataAccess().Get(id));
            return data;
        }

        public static void PlaceOrder(string list, string id)
        {
            DataSupplier.TransactionDataAccess().PlaceOrder(list, id);
        }

        public static bool CancelOrder(int id)
        {
            return DataSupplier.TransactionDataAccess().CancelOrder(id);
        }
    }
}
