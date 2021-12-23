using BEL;
using AutoMapper;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class CouponService
    {
        static CouponService()
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

        public static bool Create(CouponModel b)
        {
            b.CreatedAt = DateTime.Now;
            b.ExpiredAt = b.CreatedAt.AddDays(1);
            var data = Mapper.Map<Coupon>(b);
            DataSupplier.CouponDataAccess().Add(data);
            return true;
        }

        public static void Edit(CouponModel b)
        {
            var data = Mapper.Map<Coupon>(b);
            DataSupplier.CouponDataAccess().Edit(data);
        }

        public static bool Delete(string id)
        {
            DataSupplier.CouponDataAccess().Delete(id);
            return true;
        }

        public static List<CouponModel> Get()
        {
            var data = Mapper.Map<List<CouponModel>>(DataSupplier.CouponDataAccess().Get());
            return data;
        }
        public static CouponModel Get(string id)
        {
            var data = Mapper.Map<CouponModel>(DataSupplier.CouponDataAccess().Get(id));
            return data;
        }
    }
}
