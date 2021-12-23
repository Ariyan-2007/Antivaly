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
    public class BuyerService
    {
        static BuyerService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>();
                cfg.CreateMap<BuyerModel, Buyer>();
                cfg.CreateMap<Category, CategoryModel>();
                cfg.CreateMap<CategoryModel, Category>();
                cfg.CreateMap<Coupon, CouponModel>();
                cfg.CreateMap<CouponModel, Coupon>();
                cfg.CreateMap<User, UserModel>();
                cfg.CreateMap<UserModel, User>();
                cfg.CreateMap<UserID, UserIdModel>();
                cfg.CreateMap<UserIdModel, UserID>();
                cfg.CreateMap<Token, TokenModel>();
                cfg.CreateMap<TokenModel, Token>();
                cfg.CreateMap<Delivery, DeliveryModel>();
                cfg.CreateMap<DeliveryModel, Delivery>();
                cfg.CreateMap<Transaction, TransactionModel>();
                cfg.CreateMap<TransactionModel, Transaction>();
                cfg.CreateMap<Product, ProductModel>();
                cfg.CreateMap<ProductModel, Product>();
            });
        }
        public static void Create(BuyerModel b)
        {
            var data = Mapper.Map<Buyer>(b);
            DataSupplier.BuyerDataAccess().Add(data);
        }

        public static void Edit(BuyerModel b)
        {
            var data = Mapper.Map<Buyer>(b);
            DataSupplier.BuyerDataAccess().Edit(data);
        }

        public static void Delete(string id)
        {
            DataSupplier.BuyerDataAccess().Delete(id);
        }

        public static List<BuyerModel> Get()
        {
            var data = Mapper.Map<List<BuyerModel>>(DataSupplier.BuyerDataAccess().Get());
            return data;
        }
        public static BuyerModel Get(string id)
        {

            var data = Mapper.Map<BuyerModel>(DataSupplier.BuyerDataAccess().Get(id));
            return data;
        }
    }
}
