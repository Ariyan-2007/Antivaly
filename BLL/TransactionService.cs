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
                cfg.CreateMap<Buyer, BuyerModel>().ReverseMap();
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
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
